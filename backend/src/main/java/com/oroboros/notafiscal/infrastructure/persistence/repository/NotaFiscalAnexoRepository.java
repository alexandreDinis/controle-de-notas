package com.oroboros.notafiscal.infrastructure.persistence.repository;

import com.oroboros.notafiscal.infrastructure.persistence.entity.NotaFiscalAnexoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotaFiscalAnexoRepository extends JpaRepository<NotaFiscalAnexoEntity, Long> {

    Optional<NotaFiscalAnexoEntity> findByNotaFiscalId(Long notaFiscalId);

    void deleteByNotaFiscalId(Long notaFiscalId);

    boolean existsByNotaFiscalId(Long notaFiscalId);
}
