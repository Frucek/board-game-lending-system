package com.boardgamelending.catalog.games.infrastructure.web;

import com.boardgamelending.catalog.games.domain.Difficulty;
import com.boardgamelending.catalog.games.domain.Game;

public record GameResponse(
        Long id,
        String name,
        String description,
        String category,
        Integer minPlayers,
        Integer maxPlayers,
        Difficulty difficulty,
        Boolean available) {

    public static GameResponse from(Game game) {
        return new GameResponse(
                game.getId(),
                game.getName(),
                game.getDescription(),
                game.getCategory(),
                game.getMinPlayers(),
                game.getMaxPlayers(),
                game.getDifficulty(),
                game.getAvailable());
    }
}