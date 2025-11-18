#!/usr/bin/env python3
"""
Quick health check for note-taking app
Returns only essential status info to minimize token usage
"""
import subprocess
import socket
import sys

def check_port(port, service_name):
    """Check if a port is listening"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    status = "✅ Running" if result == 0 else "❌ Not running"
    print(f"{service_name:20} (port {port}): {status}")
    return result == 0

def check_docker():
    """Check if Docker container is running"""
    try:
        result = subprocess.run(
            ['docker', 'ps', '--filter', 'name=postgres', '--format', '{{.Status}}'],
            capture_output=True, text=True, timeout=5
        )
        if result.stdout.strip():
            print(f"{'PostgreSQL (Docker)':20}: ✅ {result.stdout.strip()}")
            return True
        else:
            print(f"{'PostgreSQL (Docker)':20}: ❌ Not running")
            return False
    except:
        print(f"{'PostgreSQL (Docker)':20}: ❌ Docker not available")
        return False

def main():
    print("\n🔍 Note App Health Check")
    print("=" * 60)
    
    # Check services
    frontend_ok = check_port(3000, "Frontend (Next.js)")
    backend_ok = check_port(8080, "Backend (Rust/Axum)")
    db_ok = check_docker()
    
    print("=" * 60)
    
    # Overall status
    all_ok = frontend_ok and backend_ok and db_ok
    
    if all_ok:
        print("✅ All services running")
        print("🌐 App: http://localhost:3000")
        sys.exit(0)
    else:
        print("❌ Some services not running")
        print("💡 Run: .\\workflows\\restart-services.ps1")
        sys.exit(1)

if __name__ == "__main__":
    main()
