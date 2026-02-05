package com.api.betdobem.events;

import com.api.betdobem.enums.ContextType;

public record ProofDecidedEvent(
        Long proofId,
        ContextType contextType,
        boolean approved
) {
}
