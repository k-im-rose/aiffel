// PDF 글자를 페이지별로 뽑는다 (macOS PDFKit). 사용: swift pdf-text.swift 파일.pdf > out.txt
import PDFKit
guard CommandLine.arguments.count > 1, let d = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1])) else {
  FileHandle.standardError.write("PDF를 열 수 없습니다\n".data(using: .utf8)!); exit(1)
}
for i in 0..<d.pageCount { print("=== p\(i+1)"); print(d.page(at: i)?.string ?? "") }
