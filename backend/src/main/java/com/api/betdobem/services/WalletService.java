package com.api.betdobem.services;

import com.api.betdobem.domain.*;
import com.api.betdobem.dtos.responses.PagedResponse;
import com.api.betdobem.dtos.responses.TransactionResponse;
import com.api.betdobem.enums.BetStatus;
import com.api.betdobem.enums.ChallengeStatus;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.enums.TransactionType;
import com.api.betdobem.infra.exceptions.InsufficientFundsException;
import com.api.betdobem.repositories.TransactionRepository;
import com.api.betdobem.repositories.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class WalletService {
    private TransactionRepository transactionRepository;
    private UserRepository userRepository;

    @Value("${app.activity.reward.amount}")
    private Long activityRewardAmount;

    @Value("${app.challenge.buy-cost}")
    private Long challengeBuyCost;

    public WalletService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public void holdsFundsForCreatedBet(Bet bet) {
        processHoldFunds(bet.getCreator(), bet.getBuyIn(), TransactionType.BET_ENTRY, ContextType.BET, bet.getId());
    }

    public void holdsFundsForAcceptedBet(Bet bet) {
        processHoldFunds(bet.getOpponent(), bet.getBuyIn(), TransactionType.BET_ENTRY, ContextType.BET, bet.getId());
    }

    public void holdsFundsForCreatedChallenge(Challenge challenge) {
        processHoldFunds(challenge.getChallenger(), challenge.getAmount(), TransactionType.CHALLENGE_ENTRY, ContextType.CHALLENGE, challenge.getId());
    }

    public void holdsFundsForAcceptedChallenge(Challenge challenge) {
        processHoldFunds(challenge.getChallenged(), challenge.getAmount(), TransactionType.CHALLENGE_ENTRY, ContextType.CHALLENGE, challenge.getId());
    }

    private void processHoldFunds(User user, Long amount, TransactionType transactionType, ContextType contextType, Long contextId) {
        if (!userHasSufficientFunds(user, amount)) {
            throw new InsufficientFundsException("User " + user.getUsername() + " does not have enough coins to perform this action.");
        }
        subtractAmountFromUser(user, amount);
        createTransaction(user, amount * (-1), transactionType, contextType, contextId);
    }

    @Transactional
    public void buyChallengeOption(User user, Long cost) {
        if (!userHasSufficientFunds(user, cost)) {
            throw new InsufficientFundsException("User " + user.getUsername() + " does not have enough coins to perform this action.");
        }
        subtractAmountFromUser(user, cost);
        createTransaction(user, cost * (-1), TransactionType.CHALLENGE_BUY, ContextType.CHALLENGE, null);
    }

    @Transactional
    public void returnsFundsForDeclinedBet(Bet bet) {
        if (transactionRepository.existsByTransactionTypeAndContextIdAndUserId(TransactionType.BET_REFUND, bet.getId(), bet.getCreator().getId())) return;
        if (bet.getStatus() != BetStatus.DECLINED) return;
        addAmountToUser(bet.getCreator(), bet.getBuyIn());
        createTransaction(bet.getCreator(), bet.getBuyIn(), TransactionType.BET_REFUND, ContextType.BET, bet.getId());
    }

    @Transactional
    public void returnsFundsForDeclinedChallenge(Challenge challenge) {
        if (transactionRepository.existsByTransactionTypeAndContextIdAndUserId(TransactionType.CHALLENGE_REFUND, challenge.getId(), challenge.getChallenger().getId())) return;
        if (challenge.getStatus() != ChallengeStatus.DECLINED && challenge.getStatus() != ChallengeStatus.EXPIRED) return;
        User challenger = challenge.getChallenger();
        addAmountToUser(challenger, challenge.getAmount());
        if (challenger.isHasBoughtChallenge()) {
            addAmountToUser(challenger, challengeBuyCost);
            createTransaction(challenger, challengeBuyCost, TransactionType.CHALLENGE_BUY_REFUND, ContextType.CHALLENGE, challenge.getId());
        }
        createTransaction(challenger, challenge.getAmount(), TransactionType.CHALLENGE_REFUND, ContextType.CHALLENGE, challenge.getId());
    }

    @Transactional
    public void returnsFundsForDrawnBet(Bet bet) {
        if (transactionRepository.existsByTransactionTypeAndContextIdAndUserId(TransactionType.BET_REFUND, bet.getId(), bet.getCreator().getId()) ||
                transactionRepository.existsByTransactionTypeAndContextIdAndUserId(TransactionType.BET_REFUND, bet.getId(), bet.getOpponent().getId())) return;
        if (bet.getStatus() != BetStatus.FINISHED_DRAW) return;
        addAmountToUser(bet.getCreator(), bet.getBuyIn());
        addAmountToUser(bet.getOpponent(), bet.getBuyIn());
        for (User user : new User[]{bet.getCreator(), bet.getOpponent()}) {
            createTransaction(user, bet.getBuyIn(), TransactionType.BET_REFUND, ContextType.BET, bet.getId());
        }
    }

    private void subtractAmountFromUser(User user, Long amount) {
        user.setCoins(user.getCoins() - amount);
        userRepository.save(user);
    }

    private void addAmountToUser(User user, Long amount) {
        user.setCoins(user.getCoins() + amount);
        userRepository.save(user);
    }

    @Transactional
    public void payBetWinner(User winner, Bet bet) {
        processPayment(winner, bet.getBuyIn() * 2L, TransactionType.BET_WIN, ContextType.BET, bet.getId());
    }

    // TODO: Analyze and implement SYSTEM_BANK in case of event entity creation
    @Transactional
    public void payChallengeWinner(User winner, Challenge challenge) {
        if (challenge.getChallenger().equals(winner)) {
            processPayment(winner, challenge.getAmount(), TransactionType.CHALLENGE_REFUND, ContextType.CHALLENGE, challenge.getId());
        } else {
            processPayment(winner, challenge.getAmount() * 2L, TransactionType.CHALLENGE_WIN, ContextType.CHALLENGE, challenge.getId());
        }
    }

    @Transactional
    public void payActivityReward(Activity activity) {
        processPayment(activity.getAuthor(), activityRewardAmount, TransactionType.REWARD, ContextType.ACTIVITY, activity.getId());
    }

    private void processPayment(User user, Long amount, TransactionType transactionType, ContextType contextType, Long contextId) {
        if (transactionRepository.existsByTransactionTypeAndContextIdAndUserId(transactionType, contextId, user.getId())) {
            return;
        }
        addAmountToUser(user, amount);
        createTransaction(user, amount, transactionType, contextType, contextId);
    }

    private boolean userHasSufficientFunds(User user, Long amount) {
        return user.getCoins().compareTo(amount) >= 0;
    }

    public PagedResponse<TransactionResponse> getUserTransactions(Long userId, Pageable pageable) {
        Page<Transaction> page = transactionRepository.findByUserId(userId, pageable);
        Page<TransactionResponse> responsePage = page.map(transaction -> new TransactionResponse(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getContextId(),
                transaction.getContextType(),
                transaction.getTransactionType(),
                transaction.getCreatedAt()
        ));
        return new PagedResponse<>(
                responsePage.getContent(),
                responsePage.getNumber(),
                responsePage.getSize(),
                responsePage.getTotalElements(),
                responsePage.getTotalPages(),
                responsePage.hasNext()
        );
    }

    private void createTransaction(User user, Long amount, TransactionType transactionType, ContextType contextType, Long contextId) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(amount);
        transaction.setTransactionType(transactionType);
        transaction.setContextType(contextType);
        transaction.setContextId(contextId);
        transactionRepository.save(transaction);
    }
}
