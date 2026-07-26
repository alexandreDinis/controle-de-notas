package com.oroboros.notafiscal.infrastructure.persistence.repository;

import com.oroboros.notafiscal.infrastructure.persistence.entity.NotaFiscalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscalEntity, Long> {

    List<NotaFiscalEntity> findByClienteIdOrderByDataEmissaoAscIdAsc(Long clienteId);

    List<NotaFiscalEntity> findByClienteIdOrderByDataEmissaoDesc(Long clienteId);

    List<NotaFiscalEntity> findByClienteIdAndDataEmissaoBetweenOrderByDataEmissaoAsc(
            Long clienteId, LocalDate inicio, LocalDate fim);

    boolean existsByClienteIdAndNumeroNota(Long clienteId, String numeroNota);
}
