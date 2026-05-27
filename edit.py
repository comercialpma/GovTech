import sys
with open(sys.argv[1], 'r') as f:
    lines = f.readlines()
with open(sys.argv[1], 'w') as f:
    for line in lines:
        f.write(line)
        if line.startswith('pick'):
            f.write("exec git commit --amend --author='Equipe GovTech <dev@govtech.com.br>' --no-edit --no-verify\n")
