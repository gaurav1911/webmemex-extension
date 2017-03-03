import { generateVisitDocId, isWorthRemembering } from '..'
import { reidentifyOrStorePage } from './log-page'


// Store the visit in PouchDB.
async function storeVisit({timestamp, url, page}) {
    const visitId = generateVisitDocId({timestamp})
    const visit = {
        _id: visitId,
        visitStart: new Date(timestamp).getTime(), // ensures it is numeric
        url,
        page: {_id: page._id}, // store only a reference to the page
    }
    await db.put(visit)
    return {visit}
}

export default async function maybeLogPageVisit({
    tabId,
    url,
    timestamp,
}) {

    // First check if we want to log this page (hence the 'maybe' in the name).
    if (!isWorthRemembering({url}))
        return

    // TODO first try to extend an existing visit instead of logging a new one.

    // First create an identifier for the page being visited.
    const {page, finalPagePromise} = await reidentifyOrStorePage({tabId, url})
    // Create a visit to this page.
    const visit = await storeVisit({page, url, timestamp})

    // TODO possibly deduplicate the visit if it was to the same page after all.
}
