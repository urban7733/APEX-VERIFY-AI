"""
Simple HTTP client for invoking a RunPod Serverless endpoint from Python.
Useful for local smoke tests or batch jobs outside the Vercel backend.
"""

from __future__ import annotations

import base64
import json
import os
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any, Dict, Optional


def _read_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Environment variable {name} is required")
    return value


@dataclass
class RunPodClient:
    endpoint_url: str
    api_key: str
    timeout: int = 120

    def _build_request(self, payload: Dict[str, Any]) -> urllib.request.Request:
        data = json.dumps(payload).encode("utf-8")
        request = urllib.request.Request(self.endpoint_url, data=data, method="POST")
        request.add_header("Content-Type", "application/json")
        request.add_header("Authorization", f"Bearer {self.api_key}")
        return request

    def invoke_bytes(
        self,
        image_bytes: bytes,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")
        payload: Dict[str, Any] = {"input": {"image_base64": image_base64}}
        if metadata:
            payload["input"]["metadata"] = metadata

        request = self._build_request(payload)
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                body = response.read()
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(
                f"RunPod request failed with HTTP {exc.code}: {error_body}"
            ) from exc

        data = json.loads(body.decode("utf-8"))
        output = data.get("output", data)
        return output.get("result", output)

    def invoke_file(self, path: str) -> Dict[str, Any]:
        with open(path, "rb") as fh:
            return self.invoke_bytes(fh.read())


def _cli(argv: list[str]) -> int:
    if len(argv) < 2:
        print("Usage: python runpod_client.py <image-path>", file=sys.stderr)
        return 1

    client = RunPodClient(
        endpoint_url=_read_env("RUNPOD_ENDPOINT_URL"),
        api_key=_read_env("RUNPOD_API_KEY"),
    )

    result = client.invoke_file(argv[1])
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(_cli(sys.argv))
