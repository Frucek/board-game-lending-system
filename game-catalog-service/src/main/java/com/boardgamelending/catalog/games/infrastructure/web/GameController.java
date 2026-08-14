package com.boardgamelending.catalog.games.infrastructure.web;

import com.boardgamelending.catalog.games.application.GameService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping
    public Flux<GameResponse> getAllGames() {
        return gameService.getAllGames()
                .map(GameResponse::from);
    }

    @GetMapping("/{id}")
    public Mono<GameResponse> getGame(
            @PathVariable Long id) {
        return gameService.getGameById(id)
                .map(GameResponse::from);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<GameResponse> createGame(
            @Valid @RequestBody GameRequest request) {
        return gameService.createGame(request)
                .map(GameResponse::from);
    }

    @PutMapping("/{id}")
    public Mono<GameResponse> updateGame(
            @PathVariable Long id,
            @Valid @RequestBody GameRequest request) {
        return gameService.updateGame(id, request)
                .map(GameResponse::from);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteGame(
            @PathVariable Long id) {
        return gameService.deleteGame(id);
    }

    @PutMapping("/{id}/availability")
    public Mono<GameResponse> updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody AvailabilityRequest request) {

        return gameService
                .updateAvailability(
                        id,
                        request.available())
                .map(GameResponse::from);
    }
}