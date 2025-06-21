package frontend

import (
	"context"
	"embed"
	"html/template"
	"io/fs"
	"net/http"
	"os"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/usememos/memos/internal/profile"
	"github.com/usememos/memos/internal/util"
	"github.com/usememos/memos/store"
)

//go:embed dist/*
var embeddedFiles embed.FS

type FrontendService struct {
	Profile *profile.Profile
	Store   *store.Store
}

func NewFrontendService(profile *profile.Profile, store *store.Store) *FrontendService {
	return &FrontendService{
		Profile: profile,
		Store:   store,
	}
}

func (fs *FrontendService) Serve(_ context.Context, e *echo.Echo) {
	skipper := func(c echo.Context) bool {
		// Skip API routes.
		if util.HasPrefixes(c.Path(), "/api", "/memos.api.v1") {
			return true
		}
		// Skip setting cache headers for index.html
		if c.Path() == "/" || c.Path() == "/index.html" {
			return false
		}
		// Set Cache-Control header to allow public caching with a max-age of 7 days.
		c.Response().Header().Set(echo.HeaderCacheControl, "public, max-age=604800") // 7 days
		return false
	}

	// Custom handler for index.html to inject runtime config
	e.GET("/", fs.serveIndexHTML)
	e.GET("/index.html", fs.serveIndexHTML)

	// Route to serve the main app with HTML5 fallback for SPA behavior.
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Filesystem: getFileSystem("dist"),
		HTML5:      true, // Enable fallback to index.html
		Skipper:    skipper,
	}))
}

func (fs *FrontendService) serveIndexHTML(c echo.Context) error {
	// Read the index.html template from embedded files
	indexHTML, err := embeddedFiles.ReadFile("dist/index.html")
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to read index.html")
	}

	// Get map config from environment variables
	mapProvider := os.Getenv("MAP_PROVIDER")
	if mapProvider == "" {
		mapProvider = "amap" // default value
	}
	
	amapKey := os.Getenv("AMAP_KEY")
	if amapKey == "" {
		amapKey = "" // default empty
	}

	// Create template data (不再传递API key到前端)
	templateData := struct {
		MapProvider string
	}{
		MapProvider: mapProvider,
	}

	// Parse and execute template
	tmpl, err := template.New("index").Parse(string(indexHTML))
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to parse index.html template")
	}

	var buf strings.Builder
	if err := tmpl.Execute(&buf, templateData); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to execute index.html template")
	}

	// Set content type and return the rendered HTML
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTML)
	return c.String(http.StatusOK, buf.String())
}

func getFileSystem(path string) http.FileSystem {
	fs, err := fs.Sub(embeddedFiles, path)
	if err != nil {
		panic(err)
	}
	return http.FS(fs)
}
