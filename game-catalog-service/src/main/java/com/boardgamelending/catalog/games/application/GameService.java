package com.boardgamelending.catalog.games.application;

import com.boardgamelending.catalog.games.domain.Game;
import com.boardgamelending.catalog.games.infrastructure.persistence.GameRepository;
import com.boardgamelending.catalog.games.infrastructure.web.GameRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class GameService {

        private static final Logger log = LoggerFactory.getLogger(GameService.class);

        private final GameRepository gameRepository;

        public GameService(GameRepository gameRepository) {
                this.gameRepository = gameRepository;
        }

        public Flux<Game> getAllGames() {
                log.info("Getting all games");

                return gameRepository.findAll();
        }

        public Mono<Game> getGameById(Long id) {
                log.info("Getting game with id={}", id);

                return gameRepository.findById(id)
                                .switchIfEmpty(
                                                Mono.error(
                                                                new ResponseStatusException(
                                                                                HttpStatus.NOT_FOUND,
                                                                                "Game not found")));
        }

        public Mono<Game> createGame(GameRequest request) {

                validatePlayers(
                                request.minPlayers(),
                                request.maxPlayers());

                log.info("Creating game: {}", request.name());

                Game game = new Game(
                                null,
                                request.name(),
                                request.description(),
                                request.category(),
                                request.minPlayers(),
                                request.maxPlayers(),
                                request.difficulty(),
                                true);

                return gameRepository.save(game);
        }

        public Mono<Game> updateGame(Long id, GameRequest request) {

                validatePlayers(
                                request.minPlayers(),
                                request.maxPlayers());

                log.info("Updating game with id={}", id);

                return gameRepository.findById(id)
                                .switchIfEmpty(
                                                Mono.error(
                                                                new ResponseStatusException(
                                                                                HttpStatus.NOT_FOUND,
                                                                                "Game not found")))
                                .flatMap(existingGame -> {

                                        existingGame.setName(request.name());
                                        existingGame.setDescription(request.description());
                                        existingGame.setCategory(request.category());
                                        existingGame.setMinPlayers(request.minPlayers());
                                        existingGame.setMaxPlayers(request.maxPlayers());
                                        existingGame.setDifficulty(request.difficulty());

                                        return gameRepository.save(existingGame);
                                });
        }

        public Mono<Void> deleteGame(Long id) {

                log.info("Deleting game with id={}", id);

                return gameRepository.findById(id)
                                .switchIfEmpty(
                                                Mono.error(
                                                                new ResponseStatusException(
                                                                                HttpStatus.NOT_FOUND,
                                                                                "Game not found")))
                                .flatMap(game -> gameRepository.deleteById(id));
        }

        private void validatePlayers(
                        Integer minPlayers,
                        Integer maxPlayers) {

                if (maxPlayers < minPlayers) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Maximum players must be greater than or equal to minimum players");
                }
        }

        public Mono<Game> updateAvailability(
                        Long id,
                        Boolean available) {

                log.info(
                                "Updating availability for game id={} to {}",
                                id,
                                available);

                return gameRepository.findById(id)
                                .switchIfEmpty(
                                                Mono.error(
                                                                new ResponseStatusException(
                                                                                HttpStatus.NOT_FOUND,
                                                                                "Game not found")))
                                .flatMap(game -> {

                                        game.setAvailable(
                                                        available);

                                        return gameRepository.save(game);
                                });
        }
}
