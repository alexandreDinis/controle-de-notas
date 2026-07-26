package com.oroboros.notafiscal.web.dto;

import java.time.LocalDateTime;

public record ClienteResponse(
        Long id,
        String nome,
        String telefone,
        String email,
        String documento,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {}
