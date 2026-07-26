package com.oroboros.notafiscal.web.controller;

import com.oroboros.notafiscal.application.RelatorioService;
import com.oroboros.notafiscal.web.dto.ExtratoClienteResponse;
import com.oroboros.notafiscal.web.dto.RelatorioNotasResponse;
import com.oroboros.notafiscal.web.dto.SaldoClienteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService relatorioService;

    @GetMapping("/api/clientes/{clienteId}/extrato")
    public ResponseEntity<ExtratoClienteResponse> extratoPorCliente(
            @PathVariable Long clienteId) {
        return ResponseEntity.ok(relatorioService.extratoPorCliente(clienteId));
    }

    @GetMapping("/api/clientes/{clienteId}/notas-fiscais/relatorio")
    public ResponseEntity<RelatorioNotasResponse> notasPorPeriodo(
            @PathVariable Long clienteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(
                relatorioService.notasPorClientePeriodo(clienteId, inicio, fim));
    }

    @GetMapping("/api/relatorios/clientes-com-debito")
    public ResponseEntity<List<SaldoClienteResponse>> clientesComDebito() {
        return ResponseEntity.ok(relatorioService.clientesComDebito());
    }

    @GetMapping("/api/relatorios/clientes-com-credito")
    public ResponseEntity<List<SaldoClienteResponse>> clientesComCredito() {
        return ResponseEntity.ok(relatorioService.clientesComCredito());
    }
}
