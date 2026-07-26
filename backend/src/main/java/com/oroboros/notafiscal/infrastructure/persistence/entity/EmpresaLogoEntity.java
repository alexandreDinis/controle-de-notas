package com.oroboros.notafiscal.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "empresa_logo")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EmpresaLogoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false, unique = true)
    private EmpresaEntity empresa;

    @Column(name = "nome_arquivo", nullable = false, length = 300)
    private String nomeArquivo;

    @Column(name = "tipo_conteudo", nullable = false, length = 100)
    private String tipoConteudo;

    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Column(name = "dados", nullable = false, columnDefinition = "BYTEA")
    private byte[] dados;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }
}
