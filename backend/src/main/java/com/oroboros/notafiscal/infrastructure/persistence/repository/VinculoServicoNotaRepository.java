package com.oroboros.notafiscal.infrastructure.persistence.repository;

import com.oroboros.notafiscal.infrastructure.persistence.entity.VinculoServicoNotaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VinculoServicoNotaRepository extends JpaRepository<VinculoServicoNotaEntity, Long> {

    List<VinculoServicoNotaEntity> findByClienteId(Long clienteId);

    @Modifying
    @Query("DELETE FROM VinculoServicoNotaEntity v WHERE v.cliente.id = :clienteId")
    void deleteByClienteId(Long clienteId);
}
