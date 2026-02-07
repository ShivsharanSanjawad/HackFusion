package com.shivsharan.HackFusion.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
@Service
public class PinataService {

    @Value("${pinata.api.url}")
    private String pinataUrl;

    @Value("${pinata.api.jwt}")
    private String jwt;

    private final WebClient webClient;

    public PinataService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String uploadFileToIpfs(Resource fileResource) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", fileResource);

        return webClient.post()
                .uri(pinataUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}
