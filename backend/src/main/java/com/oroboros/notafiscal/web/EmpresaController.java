package com.oroboros.notafiscal.web;

import com.oroboros.notafiscal.application.EmpresaService;
import com.oroboros.notafiscal.infrastructure.persistence.entity.EmpresaLogoEntity;
import com.oroboros.notafiscal.web.dto.EmpresaRequest;
import com.oroboros.notafiscal.web.dto.EmpresaResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/empresa")
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaService empresaService;

    @GetMapping
    public ResponseEntity<EmpresaResponse> obter() {
        return ResponseEntity.ok(empresaService.obter());
    }

    @PutMapping
    public ResponseEntity<EmpresaResponse> salvarOuAtualizar(@Valid @RequestBody EmpresaRequest request) {
        return ResponseEntity.ok(empresaService.salvarOuAtualizar(request));
    }

    @PostMapping("/logo")
    public ResponseEntity<Void> salvarLogo(@RequestParam("file") MultipartFile file) {
        empresaService.salvarLogo(file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/logo")
    public ResponseEntity<byte[]> obterLogo() {
        EmpresaLogoEntity logo = empresaService.obterLogo();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + logo.getNomeArquivo() + "\"")
                .contentType(MediaType.parseMediaType(logo.getTipoConteudo()))
                .body(logo.getDados());
    }
}
