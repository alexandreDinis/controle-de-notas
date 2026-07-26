package com.oroboros.notafiscal.infrastructure.persistence.repository;

import com.oroboros.notafiscal.infrastructure.persistence.entity.ClienteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<ClienteEntity, Long> {

    Optional<ClienteEntity> findByDocumento(String documento);

    boolean existsByDocumento(String documento);
}
