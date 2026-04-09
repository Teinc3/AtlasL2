## Modes
AtlasL2 offers various modes that change how the communicability index is calculated and how the data is visualised on the client.


### Weight Picking
Certain related languages are reported to have asymmetrical intelligibility.
That is, speakers of one language may understand those of the other better than the other way round.

The following 3 modes are offered to account for this asymmetry in intelligibility across different contexts of communication:

#### Active Communication
This mode assumes that the user is actively conversing with a person from the target environment.
For asymmetrical pairings, the  **lower/minimum** weight within the edge will be used.

#### Passive Reception
This mode assumes that the user is passively receiving information from the target environment,
such as through media, literature, or online content.
For asymmetrical pairings, the **downstream** weight of the edge will be used.

#### Passive Broadcast
This mode assumes that the user is passively broadcasting information to the target environment,
such as through social media, online content, or advertising.
For asymmetrical pairings, the **upstream** weight of the edge will be used.


### Elevation
While the communicability index is always coded from red to green, AtlasL2 offers vertical elevation
of countries based on the following selectable modes:

#### Population/Demographics
- Communicable Population within said country
- Total Population of said country

It is possible to include literacy rate as an additional factor in the communicability index,
but this will not be within the scope of the MVP.

#### Economy
- GDP (Nominal/PPP)
- GDP Per Capita (Nominal/PPP)

It is possible to include other metrics, such as GDP Growth Rate,
but how it can be visualised in a meaningful way is still being explored.
