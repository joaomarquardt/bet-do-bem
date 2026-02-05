package com.api.betdobem.events;

import com.api.betdobem.enums.ContextType;

public record ProofDrawEvent(
        Long proofId,
        ContextType contextType
) {
}
