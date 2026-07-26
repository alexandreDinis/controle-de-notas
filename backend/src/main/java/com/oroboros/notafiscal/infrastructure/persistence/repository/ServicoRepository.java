package com.oroboros.notafiscal.infrastructure.persistence.repository;

import com.oroboros.notafiscal.infrastructure.persistence.entity.ServicoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServicoRepository extends JpaRepository<ServicoEntity, Long> {

    List<ServicoEntity> findByClienteIdOrderByDataAscIdAsc(Long clienteId);

    List<ServicoEntity> findByClienteIdOrderByDataDesc(Long clienteId);

    boolean existsByClienteIdAndNumeroOs(Long clienteId, String numeroOs);
}
