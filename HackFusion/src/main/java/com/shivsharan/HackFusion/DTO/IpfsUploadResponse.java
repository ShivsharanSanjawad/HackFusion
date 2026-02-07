package com.shivsharan.HackFusion.DTO;

import lombok.*;

/**
 * DTO for IPFS upload response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IpfsUploadResponse {

    private String cid;
    private String status;
    private String message;
    private String ipfsUrl;

    public static IpfsUploadResponse success(String cid) {
        return IpfsUploadResponse.builder()
                .cid(cid)
                .status("SUCCESS")
                .message("File uploaded to IPFS successfully")
                .ipfsUrl("https://ipfs.io/ipfs/" + cid)
                .build();
    }

    public static IpfsUploadResponse failure(String message) {
        return IpfsUploadResponse.builder()
                .status("FAILED")
                .message(message)
                .build();
    }
}