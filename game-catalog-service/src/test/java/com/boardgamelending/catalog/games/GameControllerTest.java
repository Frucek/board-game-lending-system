package com.boardgamelending.catalog.games;

import com.boardgamelending.catalog.games.application.GameService;
import com.boardgamelending.catalog.games.domain.Difficulty;
import com.boardgamelending.catalog.games.domain.Game;
import com.boardgamelending.catalog.games.infrastructure.web.GameController;
import com.boardgamelending.catalog.games.infrastructure.web.GameRequest;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.server.ResponseStatusException;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@WebFluxTest(GameController.class)
class GameControllerTest {

        @Autowired
        private WebTestClient webTestClient;

        @MockitoBean
        private GameService gameService;

        private Game createGame() {
                return new Game(
                                1L,
                                "Catan",
                                "Strategy game",
                                "Strategy",
                                3,
                                4,
                                Difficulty.MEDIUM,
                                true);
        }

        @Test
        void shouldGetAllGames() {

                when(gameService.getAllGames())
                                .thenReturn(Flux.just(createGame()));

                webTestClient.get()
                                .uri("/games")
                                .exchange()
                                .expectStatus().isOk()
                                .expectBody()
                                .jsonPath("$[0].id").isEqualTo(1)
                                .jsonPath("$[0].name").isEqualTo("Catan");
        }

        @Test
        void shouldGetGame() {

                when(gameService.getGameById(1L))
                                .thenReturn(Mono.just(createGame()));

                webTestClient.get()
                                .uri("/games/1")
                                .exchange()
                                .expectStatus().isOk()
                                .expectBody()
                                .jsonPath("$.id").isEqualTo(1)
                                .jsonPath("$.name").isEqualTo("Catan");
        }

        @Test
        void shouldCreateGame() {

                when(gameService.createGame(any(GameRequest.class)))
                                .thenReturn(Mono.just(createGame()));

                String request = """
                                {
                                    "name": "Catan",
                                    "description": "Strategy game",
                                    "category": "Strategy",
                                    "minPlayers": 3,
                                    "maxPlayers": 4,
                                    "difficulty": "MEDIUM"
                                }
                                """;

                webTestClient.post()
                                .uri("/games")
                                .contentType(MediaType.APPLICATION_JSON)
                                .bodyValue(request)
                                .exchange()
                                .expectStatus().isCreated()
                                .expectBody()
                                .jsonPath("$.id").isEqualTo(1)
                                .jsonPath("$.name").isEqualTo("Catan");
        }

        @Test
        void shouldUpdateGame() {

                when(gameService.updateGame(
                                org.mockito.ArgumentMatchers.eq(1L),
                                any(GameRequest.class))).thenReturn(Mono.just(createGame()));

                String request = """
                                {
                                    "name": "Updated Catan",
                                    "description": "Updated strategy game",
                                    "category": "Strategy",
                                    "minPlayers": 3,
                                    "maxPlayers": 4,
                                    "difficulty": "HARD"
                                }
                                """;

                webTestClient.put()
                                .uri("/games/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .bodyValue(request)
                                .exchange()
                                .expectStatus().isOk()
                                .expectBody()
                                .jsonPath("$.id").isEqualTo(1)
                                .jsonPath("$.name").isEqualTo("Catan");
        }

        @Test
        void shouldDeleteGame() {

                when(gameService.deleteGame(1L))
                                .thenReturn(Mono.empty());

                webTestClient.delete()
                                .uri("/games/1")
                                .exchange()
                                .expectStatus().isNoContent();
        }

        @Test
        void getGameById_WhenGameDoesNotExist_Returns404() {
                when(gameService.getGameById(999L))
                                .thenReturn(Mono.error(
                                                new ResponseStatusException(
                                                                HttpStatus.NOT_FOUND,
                                                                "Game not found")));

                webTestClient.get()
                                .uri("/games/999")
                                .exchange()
                                .expectStatus().isNotFound();
        }

}