package com.oroboros.notafiscal.infrastructure.persistence.repository;

import com.oroboros.notafiscal.infrastructure.persistence.entity.EmpresaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpresaRepository extends JpaRepository<EmpresaEntity, Long> {
}
