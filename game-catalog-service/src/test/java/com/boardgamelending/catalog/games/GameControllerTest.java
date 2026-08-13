package com.boardgamelending.catalog.games;

import com.boardgamelending.catalog.games.application.GameService;
import com.boardgamelending.catalog.games.domain.Difficulty;
import com.boardgamelending.catalog.games.domain.Game;
import com.boardgamelending.catalog.games.infrastructure.web.GameController;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;

import reactor.core.publisher.Mono;

import static org.mockito.Mockito.when;

@WebFluxTest(GameController.class)
class GameControllerTest {

        @Autowired
        private WebTestClient webTestClient;

        @MockitoBean
        private GameService gameService;

        @Test
        void shouldGetGame() {

                Game game = new Game(
                                1L,
                                "Catan",
                                "Strategy game",
                                "Strategy",
                                3,
                                4,
                                Difficulty.MEDIUM,
                                true);

                when(gameService.getGameById(1L))
                                .thenReturn(Mono.just(game));

                webTestClient.get()
                                .uri("/games/1")
                                .exchange()
                                .expectStatus().isOk()
                                .expectBody()
                                .jsonPath("$.id").isEqualTo(1)
                                .jsonPath("$.name").isEqualTo("Catan");
        }
}