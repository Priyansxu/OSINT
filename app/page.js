"use client"

import { useState, useEffect } from "react"
import {
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Search,
  X,
  Info,
  Folder
} from "lucide-react"
import data from "../data/osints.json"

export default function Home() {
  const [expandedNodes, setExpandedNodes] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

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
        results.push({ ...node, path: currentPath })
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
      return node.children.some(folderContainsSearchResult)
    }
    return false
  }

  const renderNode = (node, level = 0, path = []) => {
    const currentPath = [...path, node.name]
    const isExpanded = expandedNodes[node.name] || false
    const isFolder = node.type === "folder"
    const containsSearchResult = isFolder && folderContainsSearchResult(node)

    if (isSearching && searchResults.length > 0) {
      const isInResultPath = searchResults.some((result) =>
        result.path.includes(node.name) || currentPath.some((p) => result.path.includes(p))
      )
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
          className={`flex items-center py-2 ${
            isSearching && searchResults.some((r) => r.name === node.name)
              ? "bg-neutral-800"
              : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {isFolder && (
            <button
              onClick={() => toggleNode(node.name)}
              className="text-neutral-400 flex items-center mr-2"
              aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}

          {isFolder && <Folder size={16} className="text-neutral-400 mr-2" />}

          {node.type === "url" ? (
            <div className="flex items-center">
              <a
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-neutral-300 hover:text-white"
              >
                <span>{node.name}</span>
                <ExternalLink size={12} className="ml-1 text-blue-500" />
              </a>
              {indicator && (
                <span className="ml-2 text-neutral-500 text-xs">{indicator}</span>
              )}
            </div>
          ) : (
            <span
              className="text-neutral-100 cursor-pointer"
              onClick={() => toggleNode(node.name)}
            >
              {node.name}
            </span>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child, index) =>
              renderNode(child, level + 1, currentPath)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 bg-neutral-900 border-b border-neutral-800 px-4 py-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-2xl font-medium tracking-tight">OSINT Framework</h1>
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input
                type="text"
                placeholder="Search tools and resources..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-600"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
          {isSearching && searchResults.length > 0 && (
            <div className="mt-2 text-sm text-neutral-400">
              Found {searchResults.length} results
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-start mb-4 text-neutral-400 text-sm gap-2">
          <Info size={20} className="mt-[2px]" />
          <div className="space-y-1">
            <p>(T) - Link to a tool that must be installed and run locally</p>
            <p>(D) - Google Dork</p>
            <p>(R) - Requires registration</p>
            <p>(M) - URL that contains a search term and must be edited manually</p>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg p-8 overflow-auto max-h-[calc(100vh-240px)]">
          {renderNode(data)}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-4 text-center text-neutral-500 text-sm">
        <p>OSINT Framework - A collection of OSINT tools and resources</p>
      </footer>
    </div>
  )
}