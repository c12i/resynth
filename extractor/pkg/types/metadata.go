package types

import (
	"path/filepath"
	"strings"
)

// ParseMetadataFromFilename extracts speaker, event, and date from filename
// Expected format: "Speaker Name-Event Name-DD.MM.YYYY.txt"
// Example: "Kwame Nkurumah-Ghana Independence Day-06.04.1957.txt"
func ParseMetadataFromFilename(filename string) SpeechMetadata {
	// get base filename without path
	base := filepath.Base(filename)
	base = strings.TrimSuffix(base, ".txt")
	parts := strings.Split(base, "-")

	metadata := SpeechMetadata{}

	if len(parts) >= 3 {
		metadata.Speaker = strings.TrimSpace(parts[0])

		metadata.Date = strings.TrimSpace(parts[len(parts)-1])

		eventParts := parts[1 : len(parts)-1]
		metadata.Event = strings.TrimSpace(strings.Join(eventParts, "-"))
	} else if len(parts) == 2 {
		// fallback: speaker-event (no date)
		metadata.Speaker = strings.TrimSpace(parts[0])
		metadata.Event = strings.TrimSpace(parts[1])
	} else if len(parts) == 1 {
		// fallback: just use the filename as event
		metadata.Event = strings.TrimSpace(parts[0])
	}

	return metadata
}
