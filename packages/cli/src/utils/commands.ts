const inquirer = require('inquirer')
inquirer.registerPrompt('recursive', require('inquirer-recursive'));
const UpdaterRenderer = require('listr-update-renderer');
const VerboseRenderer = require('listr-verbose-renderer');

/**
 * Takes flags from the cli and converts them into prompts
 * @param questions 
 * @param flags 
 * @param ctx context 
 */
export const promptUser = async (questions: any, flags: any, ctx: any) => {
  // prompt the user for the remaining flags
  for (let q of questions) {
    // get the name of the question
    const name = q.name
    // if the user already answered this flag then
    // log it out and skip it
    if (flags[name]) {
      ctx.log(`${q.message}: ${flags[name]}`)
    }
    // if not then we need to prompt the user for the answer
    // to this flag
    else {
      // we need to evalutate the default function in this context
      if (typeof q.default === 'function') {
        q = Object.assign(q, { default: q.default(flags) })
      }
      // we need to evaluate when dynamically
      if (typeof q.when === 'function') {
        q = Object.assign(q, { when: q.when(flags) })
      }
      // prompt the user and set the answer to the flags variable
      Object.assign(flags, await inquirer.prompt([q]))
    }

    // run the post processing on the flag values
    if (typeof q.postProcess !== 'undefined') {
      Object.assign(flags, { [name]: q.postProcess(flags[name]) })
    }
  }

  return flags
}

/**
 * Generate list options based on flags
 */
export const getListOptions = (flags: any) => {
  if (flags.verbose) {
    return {
      renderer: VerboseRenderer,
      collapse: false
    }
  }
  else {
    return {
      renderer: UpdaterRenderer,
      collapse: false
    }
  }
}