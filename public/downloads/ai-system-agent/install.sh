#!/bin/bash

set -e

REPO="rapazd3-ux/ai-system-agent"
APP_NAME="ai-system-agent"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🤖 AI System Agent - Instalador Automático          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Linux*)
        if [ -f /etc/debian_version ]; then
            PKG_TYPE="deb"
            DISTRO="Debian/Ubuntu"
        elif [ -f /etc/fedora-release ]; then
            PKG_TYPE="rpm"
            DISTRO="Fedora"
        elif [ -f /etc/arch-release ]; then
            PKG_TYPE="appimage"
            DISTRO="Arch Linux"
        else
            PKG_TYPE="appimage"
            DISTRO="Linux"
        fi
        ;;
    Darwin*)
        PKG_TYPE="dmg"
        DISTRO="macOS"
        ;;
    *)
        echo -e "${RED}❌ Sistema operacional não suportado: $OS${NC}"
        echo "Use Windows PowerShell ou compile do código fonte."
        exit 1
        ;;
esac

echo -e "${GREEN}✓ Sistema detectado: $DISTRO ($ARCH)${NC}"
echo -e "${GREEN}✓ Tipo de pacote: $PKG_TYPE${NC}"
echo

# Get latest release
echo -e "${BLUE}📦 Buscando última versão...${NC}"
LATEST_URL="https://api.github.com/repos/$REPO/releases/latest"

if command -v curl &> /dev/null; then
    RELEASE_INFO=$(curl -sL "$LATEST_URL")
elif command -v wget &> /dev/null; then
    RELEASE_INFO=$(wget -qO- "$LATEST_URL")
else
    echo -e "${RED}❌ Erro: curl ou wget não encontrado${NC}"
    exit 1
fi

# Extract download URL
DOWNLOAD_URL=$(echo "$RELEASE_INFO" | grep -o "https://[^\"]*\.$PKG_TYPE" | head -1)
VERSION=$(echo "$RELEASE_INFO" | grep -o '"tag_name": *"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$DOWNLOAD_URL" ]; then
    echo -e "${YELLOW}⚠️ Nenhum release encontrado. Compilando do código fonte...${NC}"
    echo
    
    # Install dependencies
    echo -e "${BLUE}📥 Instalando dependências...${NC}"
    
    if [ -f /etc/debian_version ]; then
        sudo apt-get update
        sudo apt-get install -y libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
    elif [ -f /etc/fedora-release ]; then
        sudo dnf install -y webkit2gtk3-devel openssl-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel
    fi
    
    # Install Rust if not present
    if ! command -v cargo &> /dev/null; then
        echo -e "${BLUE}🦀 Instalando Rust...${NC}"
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source "$HOME/.cargo/env"
    fi
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo -e "${BLUE}📗 Instalando Node.js...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Clone and build
    echo -e "${BLUE}📂 Clonando repositório...${NC}"
    TEMP_DIR=$(mktemp -d)
    git clone "https://github.com/$REPO.git" "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    echo -e "${BLUE}📦 Instalando dependências Node...${NC}"
    npm install
    
    echo -e "${BLUE}🏗️ Compilando aplicativo (pode demorar alguns minutos)...${NC}"
    npm run tauri build
    
    # Install the built package
    if [ "$PKG_TYPE" = "deb" ]; then
        sudo dpkg -i src-tauri/target/release/bundle/deb/*.deb || sudo apt-get install -f -y
    else
        INSTALL_DIR="$HOME/.local/bin"
        mkdir -p "$INSTALL_DIR"
        cp src-tauri/target/release/bundle/appimage/*.AppImage "$INSTALL_DIR/$APP_NAME"
        chmod +x "$INSTALL_DIR/$APP_NAME"
    fi
    
    # Cleanup
    cd -
    rm -rf "$TEMP_DIR"
else
    echo -e "${GREEN}✓ Versão encontrada: $VERSION${NC}"
    echo -e "${BLUE}📥 Baixando de: ${NC}"
    echo "   $DOWNLOAD_URL"
    echo
    
    # Download
    TEMP_FILE="/tmp/$APP_NAME.$PKG_TYPE"
    
    if command -v curl &> /dev/null; then
        curl -L --progress-bar "$DOWNLOAD_URL" -o "$TEMP_FILE"
    else
        wget --show-progress "$DOWNLOAD_URL" -O "$TEMP_FILE"
    fi
    
    # Install
    echo
    echo -e "${BLUE}🔧 Instalando...${NC}"
    
    case "$PKG_TYPE" in
        deb)
            sudo dpkg -i "$TEMP_FILE" || sudo apt-get install -f -y
            ;;
        rpm)
            sudo rpm -i "$TEMP_FILE" || sudo dnf install -y "$TEMP_FILE"
            ;;
        appimage)
            INSTALL_DIR="$HOME/.local/bin"
            mkdir -p "$INSTALL_DIR"
            mv "$TEMP_FILE" "$INSTALL_DIR/$APP_NAME"
            chmod +x "$INSTALL_DIR/$APP_NAME"
            echo -e "${GREEN}✓ Instalado em: $INSTALL_DIR/$APP_NAME${NC}"
            
            # Add to PATH if not already
            if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
                echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$HOME/.bashrc"
                echo -e "${YELLOW}→ Adicionado $INSTALL_DIR ao PATH${NC}"
            fi
            ;;
        dmg)
            hdiutil attach "$TEMP_FILE"
            echo -e "${YELLOW}→ Arraste o app para a pasta Applications${NC}"
            ;;
    esac
    
    # Cleanup
    rm -f "$TEMP_FILE" 2>/dev/null
fi

echo
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║           ✅ Instalação concluída com sucesso!             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo
echo -e "Execute o aplicativo com: ${BLUE}$APP_NAME${NC}"
echo
echo -e "${YELLOW}🔐 Segurança:${NC}"
echo "   • Nenhum comando é executado sem sua aprovação"
echo "   • Chaves de API são armazenadas no keychain do sistema"
echo "   • Código 100% open-source"
echo
