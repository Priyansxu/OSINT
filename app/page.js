"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, ExternalLink, Search, X, Info } from "lucide-react"
import data from "./data/osints.json"

export default function Home() {
  const [expandedNodes, setExpandedNodes] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setExpandedNodes({ "OSINT Framework": true })
  }, [])

  const toggleNode = (nodeName) => {
    if (nodeName === "OSINT Framework") return

    setExpandedNodes((prev) => ({
      ...prev,
      [nodeName]: !prev[nodeName],
    }))
  }

  const handleSearch = (term) => {
    setSearchTerm(term)

    if (!term.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const results = []

    const searchInNode = (node, path = []) => {
      const currentPath = [...path, node.name]

      if (node.name.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          ...node,
          path: currentPath,
        })
      }

      if (node.children) {
        node.children.forEach((child) => searchInNode(child, currentPath))
      }
    }

    searchInNode(data)
    setSearchResults(results)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setIsSearching(false)
  }

  const folderContainsSearchResult = (node) => {
    if (!isSearching || !searchTerm) return false

    if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) return true

    if (node.children) {
      return node.children.some((child) => folderContainsSearchResult(child))
    }

    return false
  }

  const renderNode = (node, level = 0, path = [], isLastChild = false) => {
    const currentPath = [...path, node.name]
    const isExpanded = expandedNodes[node.name] || false
    const isFolder = node.type === "folder"
    const hasChildren = isFolder && node.children && node.children.length > 0
    const containsSearchResult = isFolder && folderContainsSearchResult(node)

    if (isSearching && searchResults.length > 0) {
      const isInResultPath = searchResults.some((result) => {
        return result.path.includes(node.name) || currentPath.some((p) => result.path.includes(p))
      })

      if (!isInResultPath) return null
    }

    const getIndicator = () => {
      if (node.type !== "url") return null

      const indicators = []
      if (node.isLocalTool) indicators.push("T")
      if (node.isGoogleDork) indicators.push("D")
      if (node.requiresRegistration) indicators.push("R")
      if (node.manualUrl) indicators.push("M")

      return indicators.length ? `(${indicators.join(", ")})` : null
    }

    const indicator = getIndicator()

    return (
      <div key={`${node.name}-${level}`} className="tree-node">
        <div
          className={`flex items-center py-2 relative ${
            isSearching && searchResults.some((r) => r.name === node.name) ? "bg-gray-800" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {level > 0 && (
            <>
              <div
                className="absolute border-t border-gray-700"
                style={{
                  left: `${(level - 1) * 20 + 18}px`,
                  width: "20px",
                  top: "50%",
                }}
              ></div>

              {Array.from({ length: level }).map((_, i) => {
                if (i === level - 1 && isLastChild) return null

                return (
                  <div
                    key={`vline-${i}`}
                    className="absolute border-l border-gray-700"
                    style={{
                      left: `${i * 20 + 18}px`,
                      top: i === level - 1 ? "0" : "-50%",
                      bottom: i === level - 1 ? "50%" : "-50%",
                      height: i === level - 1 ? "50%" : "100%",
                    }}
                  ></div>
                )
              })}
            </>
          )}

          {isFolder && node.name !== "OSINT Framework" ? (
            <button
              onClick={() => toggleNode(node.name)}
              className="text-gray-400 focus:outline-none flex items-center mr-3 relative"
              aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {containsSearchResult && (
                <div className="absolute w-2 h-2 bg-blue-500 rounded-full top-0 right-0 transform translate-x-1/2 -translate-y-1/2"></div>
              )}
            </button>
          ) : (
            <span className="w-4 mr-3"></span>
          )}

          {node.type === "url" ? (
            <div className="flex items-center">
              <a
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-white"
                aria-label={`Open ${node.name} in new tab`}
              >
                <span>{node.name}</span>
                <ExternalLink size={12} className="ml-1 text-blue-500" />
              </a>
              {indicator && (
                <span className="ml-2 text-gray-500 text-xs">{indicator}</span>
              )}
            </div>
          ) : (
            <span className="text-gray-100 cursor-pointer" onClick={() => toggleNode(node.name)}>
              {node.name}
            </span>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div className="relative">
            {node.children.map((child, index) =>
              renderNode(child, level + 1, currentPath, index === node.children.length - 1),
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 py-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-2xl font-medium tracking-tight">OSINT Framework</h1>

            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search tools and resources..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {isSearching && searchResults.length > 0 && (
            <div className="mt-2 text-sm text-gray-400">Found {searchResults.length} results</div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-4 text-gray-400 text-xs">
          <Info size={14} className="mr-1" />
          <p>
            (T) - Indicates a link to a tool that must be installed and run locally | 
            (D) - Google Dork, for more information: Google Hacking | 
            (R) - Requires registration | 
            (M) - Indicates a URL that contains the search term and the URL itself must be edited manually
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 overflow-auto max-h-[calc(100vh-240px)]">
          {renderNode(data)}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-4 text-center text-gray-500 text-sm">
        <p>OSINT Framework - A collection of OSINT tools and resources</p>
      </footer>
    </div>
  )
}
