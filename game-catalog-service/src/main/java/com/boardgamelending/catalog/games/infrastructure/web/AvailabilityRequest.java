package com.boardgamelending.catalog.games.infrastructure.web;

import jakarta.validation.constraints.NotNull;

public record AvailabilityRequest(
        @NotNull Boolean available) {
}