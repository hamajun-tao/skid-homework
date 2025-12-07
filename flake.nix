{
  description = "A pnpm-based project dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      # Define the target system architectures
      supportedSystems = [ "x86_64-linux" "aarch64-darwin" "x86_64-darwin" ];
      # A helper function to create outputs for all supported systems
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          default = pkgs.mkShell {
            # List all packages you need in your project shell
            packages = with pkgs; [
              nodejs_22
              
              pnpm
              
              git
            ];
          };
        }
      );
    };
}
