package com.psiplus.controller;

import back.src.main.java.com.psiplus.model.LoginRequest;
import com.psiplus.model.Psicologo;
import com.psiplus.service.PsicologoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/psicologos")
public class PsicologoController {

    @Autowired
    private PsicologoService service;

    @GetMapping
    public List<Psicologo> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Psicologo> buscar(@PathVariable Long id) {
        Psicologo psicologo = service.buscarPorId(id);
        if (psicologo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(psicologo);
    }

    @PostMapping
    public ResponseEntity<Psicologo> salvar(@RequestBody Psicologo psicologo) {
        Psicologo salvo = service.salvar(psicologo);
        URI uri = URI.create(String.format("/psicologos/%s", salvo.getPsicologoId()));
        return ResponseEntity.created(uri).body(salvo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Psicologo psicologo = service.buscarPorId(id);
        if (psicologo == null) {
            return ResponseEntity.notFound().build();
        }
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Psicologo psicologo = service.autenticar(request.getEmail(), request.getSenha());

        if (psicologo == null) {
            return ResponseEntity.status(401).body("Email ou senha inválidos");
        }

        return ResponseEntity.ok(psicologo);
    }}
