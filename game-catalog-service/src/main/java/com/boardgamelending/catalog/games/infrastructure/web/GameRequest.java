package com.boardgamelending.catalog.games.infrastructure.web;

import com.boardgamelending.catalog.games.domain.Difficulty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GameRequest(

        @NotBlank(message = "Name is required") String name,

        String description,

        @NotBlank(message = "Category is required") String category,

        @NotNull(message = "Minimum players is required") @Min(value = 1, message = "Minimum players must be at least 1") Integer minPlayers,

        @NotNull(message = "Maximum players is required") @Min(value = 1, message = "Maximum players must be at least 1") Integer maxPlayers,

        @NotNull(message = "Difficulty is required") Difficulty difficulty) {
}