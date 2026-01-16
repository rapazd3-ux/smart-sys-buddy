#!/bin/bash

set -e

REPO="SEU-USUARIO/ai-system-agent"
APP_NAME="ai-system-agent"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     AI System Agent - Instalador       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Linux*)
        if [ -f /etc/debian_version ]; then
            PKG_TYPE="deb"
        else
            PKG_TYPE="appimage"
        fi
        ;;
    Darwin*)
        PKG_TYPE="dmg"
        ;;
    *)
        echo -e "${RED}Sistema operacional não suportado: $OS${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}→ Sistema detectado: $OS ($ARCH)${NC}"
echo -e "${GREEN}→ Tipo de pacote: $PKG_TYPE${NC}"
echo

# Get latest release
echo -e "${BLUE}Buscando última versão...${NC}"
LATEST_URL="https://api.github.com/repos/$REPO/releases/latest"
DOWNLOAD_URL=$(curl -sL "$LATEST_URL" | grep "browser_download_url.*$PKG_TYPE" | head -1 | cut -d '"' -f 4)

if [ -z "$DOWNLOAD_URL" ]; then
    echo -e "${RED}Erro: Não foi possível encontrar o download${NC}"
    echo "Verifique se existem releases em: https://github.com/$REPO/releases"
    exit 1
fi

echo -e "${GREEN}→ Baixando de: $DOWNLOAD_URL${NC}"

# Download
TEMP_FILE="/tmp/$APP_NAME.$PKG_TYPE"
curl -sL "$DOWNLOAD_URL" -o "$TEMP_FILE"

# Install
case "$PKG_TYPE" in
    deb)
        echo -e "${BLUE}Instalando pacote .deb...${NC}"
        sudo dpkg -i "$TEMP_FILE"
        sudo apt-get install -f -y
        ;;
    appimage)
        echo -e "${BLUE}Configurando AppImage...${NC}"
        INSTALL_DIR="$HOME/.local/bin"
        mkdir -p "$INSTALL_DIR"
        mv "$TEMP_FILE" "$INSTALL_DIR/$APP_NAME"
        chmod +x "$INSTALL_DIR/$APP_NAME"
        echo -e "${GREEN}→ Instalado em: $INSTALL_DIR/$APP_NAME${NC}"
        ;;
    dmg)
        echo -e "${BLUE}Abrindo instalador...${NC}"
        open "$TEMP_FILE"
        echo -e "${GREEN}→ Arraste o app para a pasta Applications${NC}"
        ;;
esac

echo
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        Instalação concluída! ✓         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo
echo -e "Execute com: ${BLUE}$APP_NAME${NC}"
