.PHONY: build build-emotion build-sentiment run run-emotion run-sentiment test clean help

# Build both binaries
build: build-emotion build-sentiment

# Build emotion extractor
build-emotion:
	@echo "Building emotion extractor..."
	@go build -o emotion ./cmd/emotion
	@echo "✓ Build complete: ./emotion"

# Build sentiment analyzer
build-sentiment:
	@echo "Building sentiment analyzer..."
	@go build -o sentiment ./cmd/sentiment
	@echo "✓ Build complete: ./sentiment"

# Run emotion extractor with first speech
run: run-emotion

run-emotion: build-emotion
	@echo "Running emotion extractor with Kwame Nkrumah's speech..."
	@./emotion -input "speeches/Kwame Nkurumah-Ghana Independence Day-06.04.1957.txt"

# Run sentiment analyzer with first speech
run-sentiment: build-sentiment
	@echo "Running sentiment analyzer with Kwame Nkrumah's speech..."
	@./sentiment -input "speeches/Kwame Nkurumah-Ghana Independence Day-06.04.1957.txt"

# Process all speeches with emotion extractor only
run-all: build-emotion
	@echo "Processing all speeches for emotions..."
	@for file in speeches/*.txt; do \
		echo "Processing $$file..."; \
		./emotion -input "$$file"; \
	done
	@echo "✓ All speeches processed for emotions!"

# Process all speeches with sentiment analyzer only
run-all-sentiment: build-sentiment
	@echo "Processing all speeches for sentiment..."
	@for file in speeches/*.txt; do \
		echo "Processing $$file..."; \
		./sentiment -input "$$file"; \
	done
	@echo "✓ All speeches processed for sentiment!"

# Process all speeches with both tools (appends to existing JSON files)
run-all-speeches: build
	@echo "Processing all speeches for emotions and sentiment..."
	@for file in speeches/*.txt; do \
		echo "Processing $$file..."; \
		./emotion -input "$$file"; \
		./sentiment -input "$$file"; \
	done
	@echo "✓ All speeches processed with both tools!"

# Run tests
test:
	@echo "Running tests..."
	@go test -v ./...

# Clean build artifacts (binaries only - preserves JSON data)
clean:
	@echo "Cleaning binaries..."
	@rm -f emotion sentiment
	@echo "✓ Clean complete (JSON files preserved)"

# Clean everything including output files (use with caution!)
clean-all:
	@echo "Cleaning binaries and output files..."
	@rm -f emotion sentiment ../speeches.json ../sentiments.json
	@echo "✓ All files cleaned"

# Install dependencies
deps:
	@echo "Installing dependencies..."
	@go mod download
	@echo "✓ Dependencies installed"

# Format code
fmt:
	@echo "Formatting code..."
	@go fmt ./...
	@echo "✓ Format complete"

# Run linter
lint:
	@echo "Running linter..."
	@golangci-lint run || echo "Install golangci-lint for linting"

# Show help
help:
	@echo "Available commands:"
	@echo "  make build              - Build both emotion and sentiment binaries"
	@echo "  make build-emotion      - Build emotion extractor binary"
	@echo "  make build-sentiment    - Build sentiment analyzer binary"
	@echo "  make run                - Run emotion extractor with first speech"
	@echo "  make run-emotion        - Run emotion extractor with first speech"
	@echo "  make run-sentiment      - Run sentiment analyzer with first speech"
	@echo "  make run-all            - Process all speeches for emotions only"
	@echo "  make run-all-sentiment  - Process all speeches for sentiment only"
	@echo "  make run-all-speeches   - Process all speeches with both tools"
	@echo "  make test               - Run tests"
	@echo "  make clean              - Remove binaries only (preserves JSON)"
	@echo "  make clean-all          - Remove binaries AND JSON files (caution!)"
	@echo "  make deps               - Install dependencies"
	@echo "  make fmt                - Format code"
	@echo "  make lint               - Run linter"
	@echo "  make help               - Show this help"

