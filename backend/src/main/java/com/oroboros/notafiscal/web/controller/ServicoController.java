package com.oroboros.notafiscal.web.controller;

import com.oroboros.notafiscal.application.ServicoService;
import com.oroboros.notafiscal.web.dto.ServicoRequest;
import com.oroboros.notafiscal.web.dto.ServicoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ServicoController {

    private final ServicoService servicoService;

    @PostMapping("/api/clientes/{clienteId}/servicos")
    public ResponseEntity<ServicoResponse> criar(
            @PathVariable Long clienteId, @Valid @RequestBody ServicoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicoService.criar(clienteId, request));
    }

    @GetMapping("/api/clientes/{clienteId}/servicos")
    public ResponseEntity<List<ServicoResponse>> listarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(servicoService.listarPorCliente(clienteId));
    }

    @GetMapping("/api/servicos/{id}")
    public ResponseEntity<ServicoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicoService.buscarPorId(id));
    }

    @PutMapping("/api/servicos/{id}")
    public ResponseEntity<ServicoResponse> atualizar(
            @PathVariable Long id, @Valid @RequestBody ServicoRequest request) {
        return ResponseEntity.ok(servicoService.atualizar(id, request));
    }

    @DeleteMapping("/api/servicos/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        servicoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
