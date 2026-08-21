package com.wishcreator.todo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class TodoApiIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17-alpine");

    @LocalServerPort
    private int port;

    @Autowired
    private ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Test
    void userCanCreateReadUpdateAndDeleteATodo() throws Exception {
        HttpResponse<String> createResponse = send("POST", "/api/todos", """
                {"title":"Shape the first AI workflow"}
                """);

        assertThat(createResponse.statusCode()).isEqualTo(201);
        JsonNode created = objectMapper.readTree(createResponse.body());
        assertThat(created.get("title").asText()).isEqualTo("Shape the first AI workflow");
        assertThat(created.get("completed").asBoolean()).isFalse();
        String id = created.get("id").asText();

        HttpResponse<String> listResponse = send("GET", "/api/todos", null);
        assertThat(listResponse.statusCode()).isEqualTo(200);
        assertThat(objectMapper.readTree(listResponse.body())).hasSize(1);

        HttpResponse<String> updateResponse = send("PUT", "/api/todos/" + id, """
                {"title":"Ship the first AI workflow","completed":true}
                """);
        JsonNode updated = objectMapper.readTree(updateResponse.body());
        assertThat(updateResponse.statusCode()).isEqualTo(200);
        assertThat(updated.get("title").asText()).isEqualTo("Ship the first AI workflow");
        assertThat(updated.get("completed").asBoolean()).isTrue();
        assertThat(Instant.parse(updated.get("updatedAt").asText()))
                .isAfter(Instant.parse(created.get("updatedAt").asText()));

        HttpResponse<String> getResponse = send("GET", "/api/todos/" + id, null);
        assertThat(getResponse.statusCode()).isEqualTo(200);
        assertThat(objectMapper.readTree(getResponse.body()).get("id").asText()).isEqualTo(id);

        HttpResponse<String> deleteResponse = send("DELETE", "/api/todos/" + id, null);
        assertThat(deleteResponse.statusCode()).isEqualTo(204);
        assertThat(send("GET", "/api/todos/" + id, null).statusCode()).isEqualTo(404);
    }

    @Test
    void titleMustNotBeBlank() throws Exception {
        HttpResponse<String> response = send("POST", "/api/todos", """
                {"title":"   "}
                """);

        assertThat(response.statusCode()).isEqualTo(400);
        JsonNode problem = objectMapper.readTree(response.body());
        assertThat(problem.get("title").asText()).isEqualTo("Validation failed");
        assertThat(problem.get("errors").get("title").asText()).isEqualTo("Title must not be blank");
    }

    private HttpResponse<String> send(String method, String path, String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json");
        HttpRequest request = body == null
                ? builder.method(method, HttpRequest.BodyPublishers.noBody()).build()
                : builder.method(method, HttpRequest.BodyPublishers.ofString(body)).build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
