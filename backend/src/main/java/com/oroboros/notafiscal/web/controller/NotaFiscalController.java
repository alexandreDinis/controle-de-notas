package com.oroboros.notafiscal.web.controller;

import com.oroboros.notafiscal.application.NotaFiscalService;
import com.oroboros.notafiscal.infrastructure.persistence.entity.NotaFiscalAnexoEntity;
import com.oroboros.notafiscal.web.dto.NotaFiscalRequest;
import com.oroboros.notafiscal.web.dto.NotaFiscalResponse;
import com.oroboros.notafiscal.web.dto.StatusPagamentoRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class NotaFiscalController {

    private final NotaFiscalService notaFiscalService;

    @PostMapping("/api/clientes/{clienteId}/notas-fiscais")
    public ResponseEntity<NotaFiscalResponse> criar(
            @PathVariable Long clienteId, @Valid @RequestBody NotaFiscalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notaFiscalService.criar(clienteId, request));
    }

    @GetMapping("/api/clientes/{clienteId}/notas-fiscais")
    public ResponseEntity<List<NotaFiscalResponse>> listarPorCliente(
            @PathVariable Long clienteId) {
        return ResponseEntity.ok(notaFiscalService.listarPorCliente(clienteId));
    }

    @GetMapping("/api/notas-fiscais/{id}")
    public ResponseEntity<NotaFiscalResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(notaFiscalService.buscarPorId(id));
    }

    @PutMapping("/api/notas-fiscais/{id}")
    public ResponseEntity<NotaFiscalResponse> atualizar(
            @PathVariable Long id, @Valid @RequestBody NotaFiscalRequest request) {
        return ResponseEntity.ok(notaFiscalService.atualizar(id, request));
    }

    @DeleteMapping("/api/notas-fiscais/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        notaFiscalService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/notas-fiscais/{id}/status-pagamento")
    public ResponseEntity<NotaFiscalResponse> alterarStatusPagamento(
            @PathVariable Long id, @Valid @RequestBody StatusPagamentoRequest request) {
        return ResponseEntity.ok(notaFiscalService.alterarStatusPagamento(id, request));
    }

    @PostMapping("/api/notas-fiscais/{id}/anexo")
    public ResponseEntity<Void> uploadAnexo(
            @PathVariable Long id, @RequestParam("arquivo") MultipartFile arquivo)
            throws IOException {
        notaFiscalService.uploadAnexo(id, arquivo);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/notas-fiscais/{id}/anexo")
    public ResponseEntity<byte[]> downloadAnexo(@PathVariable Long id) {
        NotaFiscalAnexoEntity anexo = notaFiscalService.downloadAnexo(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(anexo.getTipoConteudo()));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(anexo.getNomeArquivo())
                .build());

        return new ResponseEntity<>(anexo.getDados(), headers, HttpStatus.OK);
    }

    @DeleteMapping("/api/notas-fiscais/{id}/anexo")
    public ResponseEntity<Void> excluirAnexo(@PathVariable Long id) {
        notaFiscalService.excluirAnexo(id);
        return ResponseEntity.noContent().build();
    }
}
