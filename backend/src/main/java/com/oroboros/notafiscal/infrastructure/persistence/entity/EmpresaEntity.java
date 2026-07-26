package com.oroboros.notafiscal.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "empresa")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EmpresaEntity {

    @Id
    private Long id; // Singleton ID = 1L

    @Column(length = 150)
    private String nome;

    @Column(length = 20)
    private String documento;

    @Column(name = "chave_pix", length = 100)
    private String chavePix;

    @Column(length = 50)
    private String banco;

    @Column(length = 20)
    private String agencia;

    @Column(length = 30)
    private String conta;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = 1L;
        }
        LocalDateTime now = LocalDateTime.now();
        criadoEm = now;
        atualizadoEm = now;
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}
