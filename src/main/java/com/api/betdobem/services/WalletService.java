package com.api.betdobem.services;

import com.api.betdobem.domain.*;
import com.api.betdobem.enums.BetStatus;
import com.api.betdobem.enums.ChallengeStatus;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.enums.TransactionType;
import com.api.betdobem.repositories.TransactionRepository;
import com.api.betdobem.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WalletService {
    private TransactionRepository transactionRepository;
    private UserRepository userRepository;
    @Value("${app.activity.reward.amount}")
    private Long activityRewardAmount;

    public WalletService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void holdsFundsForCreatedBet(Bet bet) {
        processHoldFunds(bet.getCreator(), bet.getBuyIn(), TransactionType.BET_ENTRY, ContextType.BET, bet.getId());
    }

    @Transactional
    public void holdsFundsForAcceptedBet(Bet bet) {
        processHoldFunds(bet.getOpponent(), bet.getBuyIn(), TransactionType.BET_ENTRY, ContextType.BET, bet.getId());
    }

    @Transactional
    public void holdsFundsForCreatedChallenge(Challenge challenge) {
        processHoldFunds(challenge.getChallenger(), challenge.getAmount(), TransactionType.CHALLENGE_ENTRY, ContextType.CHALLENGE, challenge.getId());
    }

    @Transactional
    public void holdsFundsForAcceptedChallenge(Challenge challenge) {
        processHoldFunds(challenge.getChallenged(), challenge.getAmount(), TransactionType.CHALLENGE_ENTRY, ContextType.CHALLENGE, challenge.getId());
    }

    @Transactional
    private void processHoldFunds(User user, Long amount, TransactionType transactionType, ContextType contextType, Long contextId) {
        if (!userHasSufficientFunds(user, amount)) {
            throw new IllegalArgumentException("User " + user.getName() + " does not have enough coins to perform this action.");
        }
        subtractAmountFromUser(user, amount);
        Transaction transaction = new Transaction();
        transaction.setUserId(user.getId());
        transaction.setAmount(amount * (-1));
        transaction.setTransactionType(transactionType);
        transaction.setContextType(contextType);
        transaction.setContextId(contextId);
        transactionRepository.save(transaction);
    }

    @Transactional
    public void returnsFundsForDeclinedBet(Bet bet) {
        if (transactionRepository.existsByTransactionTypeAndContextIdAndUserId(TransactionType.BET_REFUND, bet.getId(), bet.getCreator().getId())) return;
        if (bet.getStatus() != BetStatus.DECLINED) return;
        addAmountToUser(bet.getCreator(), bet.getBuyIn());
        Transaction transaction = new Transaction();
        transaction.setUserId(bet.getCreator().getId());
        transaction.setAmount(bet.getBuyIn());
        transaction.setTransactionType(TransactionType.BET_REFUND);
        transaction.setContextType(ContextType.BET);
        transaction.setContextId(bet.getId());
        transactionRepository.save(transaction);
    }

    @Transactional
    public void returnsFundsForDeclinedChallenge(Challenge challenge) {
        if (transactionRepository.existsByTransactionTypeAndContextIdAndUserId(TransactionType.CHALLENGE_REFUND, challenge.getId(), challenge.getChallenger().getId())) return;
        if (challenge.getStatus() != ChallengeStatus.DECLINED) return;
        addAmountToUser(challenge.getChallenger(), challenge.getAmount());
        Transaction transaction = new Transaction();
        transaction.setUserId(challenge.getChallenger().getId());
        transaction.setAmount(challenge.getAmount());
        transaction.setTransactionType(TransactionType.BET_REFUND);
        transaction.setContextType(ContextType.BET);
        transaction.setContextId(challenge.getId());
        transactionRepository.save(transaction);
    }

    @Transactional
    public void returnsFundsForDrawnBet(Bet bet) {
        if (transactionRepository.existsByTransactionTypeAndContextIdAndUserId(TransactionType.BET_REFUND, bet.getId(), bet.getCreator().getId()) ||
                transactionRepository.existsByTransactionTypeAndContextIdAndUserId(TransactionType.BET_REFUND, bet.getId(), bet.getOpponent().getId())) return;
        if (bet.getStatus() != BetStatus.FINISHED_DRAW) return;
        addAmountToUser(bet.getCreator(), bet.getBuyIn());
        addAmountToUser(bet.getOpponent(), bet.getBuyIn());
        for (User user : new User[]{bet.getCreator(), bet.getOpponent()}) {
            Transaction transaction = new Transaction();
            transaction.setUserId(user.getId());
            transaction.setAmount(bet.getBuyIn());
            transaction.setTransactionType(TransactionType.BET_REFUND);
            transaction.setContextType(ContextType.BET);
            transaction.setContextId(bet.getId());
            transactionRepository.save(transaction);
        }
    }

    @Transactional
    private void subtractAmountFromUser(User user, Long amount) {
        user.setCoins(user.getCoins() - amount);
        userRepository.save(user);
    }

    @Transactional
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
        Transaction transaction = new Transaction();
        transaction.setUserId(user.getId());
        transaction.setAmount(amount);
        transaction.setTransactionType(transactionType);
        transaction.setContextType(contextType);
        transaction.setContextId(contextId);
        transactionRepository.save(transaction);
    }

    private boolean userHasSufficientFunds(User user, Long amount) {
        return user.getCoins().compareTo(amount) >= 0;
    }
}
