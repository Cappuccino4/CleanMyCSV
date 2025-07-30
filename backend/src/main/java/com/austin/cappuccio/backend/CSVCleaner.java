package com.austin.cappuccio.backend;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class CSVCleaner {

    public static List<List<String>> trimCells(List<List<String>> rows) {
        return rows.stream()
                .map(row -> row.stream()
                        .map(String::trim)
                        .collect(Collectors.toList()))
                .collect(Collectors.toList());
    }

    public static List<List<String>> removeEmptyRows(List<List<String>> rows) {
        return rows.stream()
                .filter(row -> row.stream().anyMatch(cell -> !cell.trim().isEmpty()))
                .collect(Collectors.toList());
    }

    public static List<List<String>> removeDuplicateRows(List<List<String>> rows) {
        Set<List<String>> seen = new LinkedHashSet<>();
        for (List<String> row : rows) {
            seen.add(row);
        }
        return new ArrayList<>(seen);
    }

}
