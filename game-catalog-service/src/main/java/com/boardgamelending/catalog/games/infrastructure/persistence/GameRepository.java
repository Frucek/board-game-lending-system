package com.boardgamelending.catalog.games.infrastructure.persistence;

import com.boardgamelending.catalog.games.domain.Game;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRepository extends ReactiveCrudRepository<Game, Long> {
}