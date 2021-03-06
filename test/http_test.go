package dtest

import (
	"testing"

	"github.com/admpub/godownloader/httpclient"
	"github.com/admpub/godownloader/iotools"
)

func TestMultiThreadSuppurt(t *testing.T) {
	if _, e := httpclient.CheckMultipart("http://static.oper.ru/data/gallery/l1048752856.jpg"); e != nil {
		t.Error("failed: CheckMultipart must be without error", e)
	}

	if _, e := httpclient.CheckMultipart("http://static.oper.ru/data/gallery/l104875sdfs2856.jpg"); e == nil {
		t.Error("failed: CheckMultipart must with  beerror")
	}

	if _, e := httpclient.CheckMultipart("http://sdftatic.opedfr.ru/data/gallery/l1048752856.jpg"); e == nil {
		t.Error("failed: CheckMultipart size must be with error")
	}
}
func TestGetSize(t *testing.T) {
	if _, e := httpclient.GetSize("http://static.oper.ru/data/gallery/l1048752856.jpg"); e != nil {
		t.Error("failed: Get size must be without error")
	}
	if _, e := httpclient.GetSize("http://static.oper.ru/data/gallery/l104d8752856.jpg"); e == nil {
		t.Error("failed: Get size must be with error")
	}
	if _, e := httpclient.GetSize("http://sdtatic.oper.ru/data/gallery/l1048752856.jpg"); e == nil {
		t.Error("failed: Get size must be with error")
	}

}

func TestPartDownload(t *testing.T) {
	c, e := httpclient.GetSize("http://ports.ubuntu.com/dists/precise/main/installer-powerpc/current/images/powerpc/netboot/mini.iso")
	if e != nil {
		t.Error("failed: Get size must be without error")
	}
	f, _ := iotools.CreateSafeFile("part_download.data")
	defer f.Close()
	f.Truncate(c)
	dow := httpclient.CreatePartialDownloader("http://ports.ubuntu.com/dists/precise/main/installer-powerpc/current/images/powerpc/netboot/mini.iso", f, 0, 0, c)
	dow.BeforeRun()
	for {
		sta, _ := dow.DoWork()
		if sta {
			return
		}
	}

}
