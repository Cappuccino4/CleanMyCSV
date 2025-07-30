package com.austin.cappuccio.backend.controllers;

import com.austin.cappuccio.backend.CSVCleaner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular frontend
public class Controller {

    private static final Logger logger = LoggerFactory.getLogger(Controller.class);

    @GetMapping("/ping")
    public String ping() {
        logger.info("Made it");
        return "pong";
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadCSV(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean trim,
            @RequestParam(defaultValue = "false") boolean blanks,
            @RequestParam(defaultValue = "false") boolean dedupe
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("No file provided.");
            }

            // Parse into rows of cells
            BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
            List<List<String>> rows = reader.lines()
                    .map(line -> Arrays.asList(line.split(",", -1)))  // include trailing empty cells
                    .collect(Collectors.toList());

            // Apply requested transformations
            if (trim) {
                rows = CSVCleaner.trimCells(rows);
            }
            if (blanks) {
                rows = CSVCleaner.removeEmptyRows(rows);
            }
            if (dedupe) {
                rows = CSVCleaner.removeDuplicateRows(rows);
            }

            // Convert back to CSV string
            String cleaned = rows.stream()
                    .map(row -> String.join(",", row))
                    .collect(Collectors.joining("\n"));

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cleaned_" + file.getOriginalFilename() + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(cleaned.getBytes(StandardCharsets.UTF_8));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to process file: " + e.getMessage());
        }
    }


}
