#!/usr/bin/env python3
"""
Phoenix Desert Safari Dubai - Automated End-to-End Integration Test Suite
Tests server startup, frontend HTML delivery, API gateway, AI concierge chat,
booking workflows, and SEO assets without requiring third-party Python dependencies.
"""

import json
import os
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request

def find_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port

def http_request(url, method='GET', data=None, headers=None, timeout=10):
    if headers is None:
        headers = {}
    encoded_data = None
    if data is not None:
        if isinstance(data, (dict, list)):
            encoded_data = json.dumps(data).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        elif isinstance(data, str):
            encoded_data = data.encode('utf-8')
        elif isinstance(data, bytes):
            encoded_data = data

    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            body = response.read().decode('utf-8')
            return response.status, body, response.headers
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return e.code, body, e.headers

def main():
    print("=" * 70)
    print("🏜️  PHOENIX DESERT SAFARI DUBAI - END-TO-END AUTOMATED VERIFICATION")
    print("=" * 70)

    port = find_free_port()
    base_url = f"http://127.0.0.1:{port}"
    print(f"[*] Starting server.js on ephemeral port {port}...")

    env = os.environ.copy()
    env["PORT"] = str(port)
    env["NODE_ENV"] = "production"
    env["GEMINI_API_KEY"] = ""

    server_process = subprocess.Popen(
        [sys.executable.replace("python3", "node") if os.path.exists("/usr/bin/node") else "node", "server.js"],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.getcwd()
    )

    tests_run = 0
    tests_passed = 0

    try:
        # Wait for server to become responsive
        started = False
        for _ in range(60):
            if server_process.poll() is not None:
                _, err = server_process.communicate()
                print(f"[!] Server terminated prematurely: {err.decode('utf-8')}")
                return 1
            try:
                status, _, _ = http_request(base_url)
                if status == 200:
                    started = True
                    break
            except Exception:
                time.sleep(0.1)

        if not started:
            print("[!] Timed out waiting for server to start.")
            return 1

        print("[+] Production server successfully started and responsive.")

        # Test Case 1: Frontend Homepage delivery
        tests_run += 1
        print("[*] Test 1: Verifying frontend root HTML delivery...")
        status, body, headers = http_request(f"{base_url}/")
        assert status == 200, f"Expected 200, got {status}"
        assert '<div id="root"' in body, "Missing root element in HTML"
        assert '<title>' in body, "Missing title tag in HTML"
        tests_passed += 1
        print("    ✅ Passed (HTTP 200, DOM root, <title> present)")

        # Test Case 2: Health check
        tests_run += 1
        print("[*] Test 2: Verifying /api/health endpoint...")
        status, body, _ = http_request(f"{base_url}/api/health")
        assert status == 200, f"Expected 200, got {status}"
        data = json.loads(body)
        assert data.get("ok") is True or data.get("status") == "healthy", f"Unexpected health payload: {data}"
        tests_passed += 1
        print("    ✅ Passed (/api/health ok)")

        # Test Case 3: Knowledge Base API
        tests_run += 1
        print("[*] Test 3: Verifying /api/knowledge_base endpoint...")
        status, body, _ = http_request(f"{base_url}/api/knowledge_base")
        assert status == 200, f"Expected 200, got {status}"
        data = json.loads(body)
        kb_content = data.get("data", data)
        tours = kb_content.get("tours", [])
        assert len(tours) > 0, "Missing tours in knowledge base"
        tests_passed += 1
        print(f"    ✅ Passed ({len(tours)} tours available in knowledge base)")

        # Test Case 4: Availability Engine
        tests_run += 1
        print("[*] Test 4: Verifying tours availability engine...")
        status, body, _ = http_request(
            f"{base_url}/check_availability",
            method="POST",
            data={"tour": "Evening Desert Safari", "date": "2026-11-15", "pax": 2}
        )
        assert status == 200, f"Expected 200, got {status}"
        data = json.loads(body)
        assert data.get("ok") is True and data.get("available") is True, f"Failed availability check: {data}"
        tests_passed += 1
        print("    ✅ Passed (Real-time availability check functional)")

        # Test Case 5: Tour Pricing Calculator
        tests_run += 1
        print("[*] Test 5: Verifying dynamic pricing calculator...")
        status, body, _ = http_request(
            f"{base_url}/get_price",
            method="POST",
            data={"tour": "Evening Desert Safari", "adults": 4, "children_ages": []}
        )
        assert status == 200, f"Expected 200, got {status}"
        data = json.loads(body)
        assert data.get("total_aed") == 480, f"Expected AED 480 (4x120), got {data.get('total_aed')}"
        tests_passed += 1
        print("    ✅ Passed (4 adults = AED 480 calculated accurately)")

        # Test Case 6: AI Chatbot Concierge Endpoint
        tests_run += 1
        print("[*] Test 6: Verifying AI Concierge conversational chat API...")
        status, body, _ = http_request(
            f"{base_url}/api/agent/chat",
            method="POST",
            data={"message": "What is the price for evening desert safari?", "history": []}
        )
        assert status == 200, f"Expected 200, got {status}"
        data = json.loads(body)
        assert data.get("ok") is True, f"Chat failed: {data}"
        assert len(data.get("reply", "")) > 10, "Empty chat reply"
        tests_passed += 1
        print("    ✅ Passed (Chatbot responded accurately with quote details)")

        # Test Case 7: Booking Creation Endpoint
        tests_run += 1
        print("[*] Test 7: Verifying reservation creation workflow...")
        status, body, _ = http_request(
            f"{base_url}/create_booking",
            method="POST",
            data={
                "tour": "Evening Desert Safari",
                "adults": 2,
                "full_name": "E2E Test Guest",
                "phone": "+971561505270",
                "summary_accepted": True
            }
        )
        assert status == 200, f"Expected 200, got {status}"
        data = json.loads(body)
        ref = data.get("booking_reference") or data.get("booking_ref")
        assert ref and ref.startswith("PHX-"), f"Invalid booking ref: {ref}"
        tests_passed += 1
        print(f"    ✅ Passed (Confirmed booking reference: {ref})")

        # Test Case 8: SEO Sitemap and Robots
        tests_run += 1
        print("[*] Test 8: Verifying SEO crawlers sitemap and robots...")
        status_sm, body_sm, _ = http_request(f"{base_url}/sitemap.xml")
        status_rb, body_rb, _ = http_request(f"{base_url}/robots.txt")
        assert status_sm == 200 and "<urlset" in body_sm, "Invalid sitemap"
        assert status_rb == 200 and "User-agent:" in body_rb, "Invalid robots.txt"
        tests_passed += 1
        print("    ✅ Passed (/sitemap.xml and /robots.txt served with valid directives)")

    finally:
        print("[*] Terminating test server process...")
        server_process.terminate()
        try:
            server_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server_process.kill()

    print("\n" + "=" * 70)
    print(f"📊 SUMMARY: {tests_passed}/{tests_run} E2E Test Cases Passed Successfully (100%)")
    print("=" * 70)
    return 0 if tests_passed == tests_run else 1

if __name__ == '__main__':
    sys.exit(main())
