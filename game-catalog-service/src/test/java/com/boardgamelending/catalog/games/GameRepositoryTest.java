package com.boardgamelending.catalog.games;

import com.boardgamelending.catalog.games.domain.Difficulty;
import com.boardgamelending.catalog.games.domain.Game;
import com.boardgamelending.catalog.games.infrastructure.persistence.GameRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.test.context.ActiveProfiles;

import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class GameRepositoryTest {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private DatabaseClient databaseClient;

    @BeforeEach
    void cleanDatabase() {
        databaseClient.sql("DELETE FROM games")
                .fetch()
                .rowsUpdated()
                .block();
    }

    @Test
    void shouldSaveAndFindGame() {

        Game game = new Game(
                null,
                "Catan",
                "Strategy game",
                "Strategy",
                3,
                4,
                Difficulty.MEDIUM,
                true);

        StepVerifier.create(
                gameRepository.save(game))
                .assertNext(savedGame -> {

                    assertEquals("Catan", savedGame.getName());
                    assertEquals("Strategy", savedGame.getCategory());

                    StepVerifier.create(
                            gameRepository.findById(savedGame.getId()))
                            .assertNext(foundGame -> assertEquals("Catan", foundGame.getName()))
                            .verifyComplete();
                })
                .verifyComplete();
    }
}