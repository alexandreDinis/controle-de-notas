package com.oroboros.notafiscal.infrastructure.persistence.repository;

import com.oroboros.notafiscal.infrastructure.persistence.entity.EmpresaLogoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpresaLogoRepository extends JpaRepository<EmpresaLogoEntity, Long> {
    Optional<EmpresaLogoEntity> findByEmpresaId(Long empresaId);
    void deleteByEmpresaId(Long empresaId);
}
