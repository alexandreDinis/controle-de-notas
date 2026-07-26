package com.oroboros.notafiscal.web.dto;

import java.time.LocalDateTime;

public record EmpresaResponse(
        Long id,
        String nome,
        String documento,
        String chavePix,
        String banco,
        String agencia,
        String conta,
        boolean possuiLogo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {}
