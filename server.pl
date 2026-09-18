#!/usr/bin/perl
use strict;
use warnings;
use IO::Socket::INET;
use File::Basename qw(dirname);
use Cwd qw(abs_path);
use POSIX qw();

my $PORT    = 3000;
my $ROOT    = dirname(abs_path($0));
my %MIME    = (
    html => 'text/html; charset=utf-8',
    css  => 'text/css; charset=utf-8',
    js   => 'application/javascript; charset=utf-8',
    png  => 'image/png',
    jpg  => 'image/jpeg',
    jpeg => 'image/jpeg',
    gif  => 'image/gif',
    webp => 'image/webp',
    svg  => 'image/svg+xml',
    ico  => 'image/x-icon',
    woff => 'font/woff',
    woff2=> 'font/woff2',
    ttf  => 'font/ttf',
    json => 'application/json',
    txt  => 'text/plain; charset=utf-8',
);

my $server = IO::Socket::INET->new(
    LocalPort => $PORT,
    Proto     => 'tcp',
    Listen    => 10,
    ReuseAddr => 1,
) or die "Cannot bind to port $PORT: $!\n";

print "Server running at http://localhost:$PORT\n";
$| = 1;

while (my $client = $server->accept()) {
    my $request = '';
    while (my $line = <$client>) {
        $request .= $line;
        last if $line =~ /^\r?\n$/;
    }

    my ($method, $path) = $request =~ /^(\w+)\s+(\S+)\s+HTTP/;
    $path //= '/';

    # strip query string
    $path =~ s/\?.*$//;

    # decode URL encoding
    $path =~ s/%([0-9A-Fa-f]{2})/chr(hex($1))/ge;

    # default to index.html
    $path = '/index.html' if $path eq '/';

    # Prevent directory traversal
    $path =~ s|/\.\./|/|g;

    my $file = $ROOT . $path;
    $file =~ s|/|\\|g if $^O eq 'MSWin32';

    if (-f $file) {
        my ($ext) = $file =~ /\.(\w+)$/;
        $ext = lc($ext // '');
        my $mime = $MIME{$ext} // 'application/octet-stream';

        open my $fh, '<:raw', $file or do {
            print $client "HTTP/1.1 500 Internal Server Error\r\nContent-Length: 5\r\n\r\nError";
            close $client;
            next;
        };
        local $/;
        my $body = <$fh>;
        close $fh;

        printf $client "HTTP/1.1 200 OK\r\nContent-Type: %s\r\nContent-Length: %d\r\nConnection: close\r\n\r\n",
            $mime, length($body);
        print $client $body;
    } else {
        my $body = "<h1>404 – Not Found</h1><p>$path</p>";
        printf $client "HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\nContent-Length: %d\r\nConnection: close\r\n\r\n%s",
            length($body), $body;
    }

    close $client;
}
