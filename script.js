 class CFG {
            constructor() {
                this.productions = {};
                this.startSymbol = null;
            }

            addProduction(nonterminal, production) {
                if (!this.startSymbol) {
                    this.startSymbol = nonterminal;
                }
                if (!this.productions[nonterminal]) {
                    this.productions[nonterminal] = [];
                }
                const parts = production.split("|");
                for (let part of parts) {
                    let trimmed = part.trim();
                    if (trimmed.toLowerCase() === "ε" || trimmed.toLowerCase() === "espsilon") {
                        trimmed = "ɛ";
                    }
                    this.productions[nonterminal].push(trimmed ? trimmed : "ɛ");
                }
            }

            resetGrammar() {
                this.productions = {};
                this.startSymbol = null;
            }

            displayGrammar() {
                let grammarLines = [];
                if (this.startSymbol) {
                    grammarLines.push(`Start Symbol: ${this.startSymbol}`);
                }
                for (const nt in this.productions) {
                    let prods = this.productions[nt].map((p) => (p === "" ? "ɛ" : p));
                    grammarLines.push(`${nt} → ${prods.join(" | ")}`);
                }
                return grammarLines.join("\n");
            }

            testString(string) {
                if (!this.startSymbol) {
                    return { result: false, derivation: [], message: "No CFG loaded." };
                }
                return this.isDerived(string);
            }

            isDerived(targetString) {
                let queue = [];
                queue.push({ current: this.startSymbol, derivation: [] });
                let visited = new Set();

                while (queue.length > 0) {
                    let { current, derivation } = queue.shift();

                    if (visited.has(current)) continue;
                    visited.add(current);

                    if (current === targetString) {
                        return { result: true, derivation: derivation };
                    }

                    if (targetString === "") {
                        if (current.length > 10) continue;
                    } else {
                        if (current.length > targetString.length * 3) continue;
                    }

                    let leftmostPos = -1;
                    for (let i = 0; i < current.length; i++) {
                        if (this.productions.hasOwnProperty(current[i])) {
                            leftmostPos = i;
                            break;
                        }
                    }
                    if (leftmostPos === -1) continue;

                    let nonterminal = current[leftmostPos];
                    let productions = this.productions[nonterminal] || [];

                    for (let prod of productions) {
                        let newStr = "";
                        if (prod === "ɛ") {
                            newStr = current.slice(0, leftmostPos) + current.slice(leftmostPos + 1);
                        } else {
                            newStr = current.slice(0, leftmostPos) + prod + current.slice(leftmostPos + 1);
                        }

                        let newDerivation = derivation.concat([
                            {
                                Rule: `${nonterminal} → ${prod}`,
                                Application: current,
                                Result: newStr,
                            },
                        ]);
                        queue.push({ current: newStr, derivation: newDerivation });
                    }
                }
                return { result: false, derivation: [] };
            }
        }

        let cfgObj = new CFG();
        let testResults = [];

        function updateStartSymbol() {
            const startSymbol = document.getElementById("startSymbol").value.trim();
            if (startSymbol) {
                cfgObj.startSymbol = startSymbol;
                updateCFGDisplay();
            }
        }

        function addProduction() {
            const productionInput = document.getElementById("productions").value.trim();
            if (!productionInput) {
                alert("Productions cannot be empty!");
                return;
            }

            const lines = productionInput.split("\n");
            for (let line of lines) {
                const parts = line.split(/→|->/);
                if (parts.length !== 2) {
                    alert(`Invalid production format in line: "${line}". Use "→" or "->" to separate LHS and RHS.`);
                    return;
                }
                const lhs = parts[0].trim();
                const rhs = parts[1].trim();
                if (!lhs) {
                    alert(`Left-hand side cannot be empty in line: "${line}"`);
                    return;
                }
                cfgObj.addProduction(lhs, rhs);
            }
            updateCFGDisplay();
            document.getElementById("productions").value = "";
        }

        function resetCFG() {
            cfgObj.resetGrammar();
            cfgObj.startSymbol = "S";
            testResults = [];
            document.getElementById("startSymbol").value = "S";
            document.getElementById("productions").value = "";
            updateCFGDisplay();
            document.getElementById("resultTable").innerHTML = "";
        }

        function updateCFGDisplay() {
            const display = document.getElementById("cfgDisplay");
            display.value = cfgObj.displayGrammar();
        }

        function testString() {
            if (Object.keys(cfgObj.productions).length === 0) {
                alert("No productions entered. Cannot test string.");
                return;
            }
            let rawInput = document.getElementById("testString").value;
            if (/^(ε|espsilon)$/i.test(rawInput.trim()) || rawInput.trim() === "") {
                rawInput = "";
            }
            const { result, derivation } = cfgObj.testString(rawInput);
            const displayStr = rawInput === "" ? "ε" : rawInput;
            testResults.push({ string: displayStr, matches: result, derivation });
            updateResults();
        }

        function updateResults() {
            const table = document.getElementById("resultTable");
            table.innerHTML = "";
            testResults.forEach((result) => {
                const row = `<tr class="${result.matches ? "bg-teal-50/20" : "bg-pink-50/20"}">
                          <td class="border-2 border-white/20 p-3 text-white">${result.string}</td>
                          <td class="border-2 border-white/20 p-3 text-white">${result.matches ? "Yes" : "No"}</td>
                          <td class="border-2 border-white/20 p-3 text-white">${result.derivation
                        .map(
                            (step) =>
                                `<div><strong>${step.Rule}</strong><br>${step.Application} ⇒ ${step.Result}</div>`
                        )
                        .join("<hr>")}</td>
                        </tr>`;
                table.innerHTML += row;
            });
        }

        updateCFGDisplay();

