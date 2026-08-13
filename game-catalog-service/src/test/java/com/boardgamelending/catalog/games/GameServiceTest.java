package com.boardgamelending.catalog.games;

import com.boardgamelending.catalog.games.application.GameService;
import com.boardgamelending.catalog.games.domain.Difficulty;
import com.boardgamelending.catalog.games.domain.Game;
import com.boardgamelending.catalog.games.infrastructure.persistence.GameRepository;
import com.boardgamelending.catalog.games.infrastructure.web.GameRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {

        @Mock
        private GameRepository gameRepository;

        @InjectMocks
        private GameService gameService;

        @Test
        void shouldCreateGame() {

                GameRequest request = new GameRequest(
                                "Catan",
                                "Strategy game",
                                "Strategy",
                                3,
                                4,
                                Difficulty.MEDIUM);

                Game savedGame = new Game(
                                1L,
                                "Catan",
                                "Strategy game",
                                "Strategy",
                                3,
                                4,
                                Difficulty.MEDIUM,
                                true);

                when(gameRepository.save(any(Game.class)))
                                .thenReturn(Mono.just(savedGame));

                StepVerifier.create(gameService.createGame(request))
                                .expectNextMatches(game -> game.getId().equals(1L)
                                                && game.getName().equals("Catan")
                                                && game.getAvailable())
                                .verifyComplete();
        }

        @Test
        void shouldFindGameById() {

                Game game = new Game(
                                1L,
                                "Catan",
                                "Strategy game",
                                "Strategy",
                                3,
                                4,
                                Difficulty.MEDIUM,
                                true);

                when(gameRepository.findById(1L))
                                .thenReturn(Mono.just(game));

                StepVerifier.create(gameService.getGameById(1L))
                                .expectNextMatches(found -> found.getId().equals(1L))
                                .verifyComplete();
        }
}