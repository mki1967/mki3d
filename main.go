/* to start local server: go run main.go */

package main

import (
    // "fmt"
    // "io"
    "net/http"
    "log"
)


func main() {
	err := 	http.ListenAndServe(":8000", http.FileServer(http.Dir(".")))
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
    }
}

