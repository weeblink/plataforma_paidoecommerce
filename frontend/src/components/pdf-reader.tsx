import {
  Root,
  Viewport,
  Pages,
  Page,
  Thumbnails,
  Thumbnail,
  CurrentPage,
  CurrentZoom,
  ZoomIn,
  ZoomOut,
  CanvasLayer,
} from '@fileforge/pdfreader'
import { LoaderCircle } from 'lucide-react'
import {useEffect, useState} from "react";
import {api} from "@/services/api.ts";

interface Props {
  fileId: string,
}

export default function PDFReader({fileId} : Props) {

  const [pdfBlob, setPdfBlob] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const response = await api.get(`/extras/${fileId}/get-file`, {
          responseType: 'blob', // Important: set responseType to blob
          headers: {
            'Accept': 'application/pdf',
          }
        })

        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setPdfBlob(url)
        setError(null)

      } catch (error) {
        console.error('Error fetching PDF:', error)
      }
    }

    fetchPDF();

    return () => {
      if (pdfBlob) {
        URL.revokeObjectURL(pdfBlob)
      }
    }
  }, [fileId])

  if (error) {
    return (
        <div className="flex items-center justify-center p-4 text-red-500">
          {error}
        </div>
    )
  }

  if (!pdfBlob) {
    return (
        <div className="flex items-center justify-center p-4">
          <LoaderCircle className="size-4 animate-spin text-primary" />
          Carregando PDF...
        </div>
    )
  }

  return (
    <Root
      className="relative flex h-[700px] flex-col justify-stretch overflow-hidden rounded-md border bg-gray-100"
      fileURL={pdfBlob}
      loader={
        <div className="flex items-center gap-2 p-4">
          <LoaderCircle className="size-4 animate-spin text-primary" />
          Carregando...
        </div>
      }
    >
      <div className="flex items-center justify-center gap-2 border-b bg-gray-100 p-1 text-sm text-gray-600">
        <button
          className="hidden rounded-full px-2 py-1 hover:bg-gray-300 hover:text-gray-900 lg:block"
          onClick={function ra() {}}
        >
          Esconder miniaturas
        </button>
        <span className="flex-grow" />
        Pagina
        <CurrentPage className="rounded-full border bg-white px-3 py-1 text-center" />
        Zoom
        <ZoomOut className="-mr-2 px-3 py-1 text-gray-900">-</ZoomOut>
        <CurrentZoom className="w-16 rounded-full border bg-white px-3 py-1 text-center" />
        <ZoomIn className="-ml-2 px-3 py-1 text-gray-900">+</ZoomIn>
        <span className="flex-grow" />
      </div>
      <div className="relative grid min-h-0 grow basis-0 transition-all duration-300 lg:grid-cols-[24rem,1fr]">
        <div className="hidden overflow-y-auto overflow-x-hidden lg:block">
          <div className="w-96 overflow-x-hidden">
            <Thumbnails className="flex flex-col items-center gap-4 py-4">
              <Thumbnail className="w-48 transition-all hover:shadow-lg hover:outline hover:outline-gray-300" />
            </Thumbnails>
          </div>
        </div>
        <Viewport className="h-full p-4">
          <Pages>
            <Page className="my-4">
              <CanvasLayer />
            </Page>
          </Pages>
        </Viewport>
      </div>
    </Root>
  )
}
